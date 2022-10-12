<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidModeException;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

/** select html element */
class ArrayElement extends AbstractElement
{
    public const MODE_SINGLE = 'single';
    public const MODE_MULTIPLE = 'multiple';

    public const MODES = [
        self::MODE_SINGLE,
        self::MODE_MULTIPLE,
    ];

    public function __construct(
        protected readonly string $name,
        protected readonly string $label,
        protected readonly array $options,
        protected readonly string $mode = self::MODE_SINGLE,
        protected readonly bool $required = true
    ) {
        if (false === \in_array($this->mode, static::MODES, true)) {
            throw new InvalidModeException($name, $this->mode, static::MODES);
        }
    }

    protected function getType(): string
    {
        return 'array';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value) {
            $value = (array)$value;

            /* @todo refactor for multi level array */
            if (false === empty($diff = \array_diff($value, \array_keys($this->options)))) {
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
