<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Element\Trait\ReadonlyTrait;
use Drjele\Symfony\JsonForm\Element\Trait\RequiredTrait;
use Drjele\Symfony\JsonForm\Exception\InvalidModeException;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

/** select html element */
class ArrayElement extends AbstractElement
{
    use ReadonlyTrait;
    use RequiredTrait;

    public const MODE_SINGLE = 'single';
    public const MODE_MULTIPLE = 'multiple';

    public const MODES = [
        self::MODE_SINGLE,
        self::MODE_MULTIPLE,
    ];

    public function __construct(
        string $name,
        string $label,
        protected readonly array $options,
        protected readonly string $mode = self::MODE_SINGLE
    ) {
        parent::__construct($name, $label);

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

            if (false === empty($diff = \array_diff($value, $this->getOptionsValues()))) {
                \print_r([$value, $this->getOptionsValues()]);

                throw new InvalidValueException($this->getName(), $diff);
            }
            /* @todo add more validations */
        }

        return [
            'options' => $this->options,
            'mode' => $this->mode,
            'readonly' => $this->readonly,
            'required' => $this->required,
            'value' => $value,
        ];
    }

    private function getOptionsValues(): array
    {
        $optionsValues = [];

        foreach ($this->options as $key => $value) {
            if (true === \is_array($value)) {
                $optionsValues = \array_merge($optionsValues, \array_keys($value));
                continue;
            }

            $optionsValues[] = $key;
        }

        return $optionsValues;
    }
}
