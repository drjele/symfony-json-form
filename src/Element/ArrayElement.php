<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidModeException;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class ArrayElement extends AbstractElement
{
    public const MODE_SINGLE = 'single';
    public const MODE_MULTIPLE = 'multiple';

    public const MODES = [
        self::MODE_SINGLE,
        self::MODE_MULTIPLE,
    ];

    private array $options;
    private string $mode;
    private bool $required;

    public function __construct(
        string $name,
        array $options,
        string $mode = self::MODE_SINGLE,
        bool $required = true
    ) {
        if (!\in_array($mode, static::MODES, true)) {
            throw new InvalidModeException($name, $mode, static::MODES);
        }

        $this->name = $name;
        $this->options = $options;
        $this->mode = $mode;
        $this->required = $required;
    }

    protected function getType(): string
    {
        return 'array';
    }

    protected function renderElement($value): array
    {
        if (null !== $value) {
            $value = (array)$value;

            /* @todo refactor for multi level array */
            if ($diff = \array_diff($value, \array_keys($this->options))) {
                throw new InvalidValueException($this->name, $diff);
            }
            /* @todo add more validations */
        }

        return [
            'options' => $this->options,
            'mode' => $this->mode,
            'required' => $this->required,
            'value' => $value,
        ];
    }
}
